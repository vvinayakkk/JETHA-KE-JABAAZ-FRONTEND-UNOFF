import React, { useContext, useEffect, useState } from "react";
import SideBarComp from "./SideBarComp";
import { ThemeContext } from "../ThemeContext";
import { CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";
import { HiFolderPlus } from "react-icons/hi2";
import PopupForm from "./PopupForm"; 
import PopupForm1 from "./PopupForm1";
import { PiEmptyBold } from "react-icons/pi";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import { MdOutlineDoneOutline } from "react-icons/md";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import AutoClosePopup from "./Popup";

function Practice() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { theme } = useContext(ThemeContext);
    const [popUpAssignment, setPopUpAssignment] = useState(false);
    const [popUpSelfStudy, setPopUpSelfStudy] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [selfStudy, setSelfStudy] = useState([]);
    const [popupVisible, setPopupVisible] = useState(true);

    useEffect(() => {
        fetchAssignment(currentDate);
        fetchSelfStudy(currentDate);
    }, [currentDate]);

    function handleAddAssignment() {
        setPopUpAssignment(!popUpAssignment);
    }

    function handleAddSelfStudy() {
        setPopUpSelfStudy(!popUpSelfStudy);
    }

    function handlePrevDate() {
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setCurrentDate(prevDate);
    }

    function handleNextDate() {
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        setCurrentDate(nextDate);
    }

    async function fetchAssignment(currentDate) {
        const formattedDate = formatDate(currentDate);
        const res = await axios.get(`http://localhost:8000/todolist/assignments/${formattedDate}/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        setAssignments(res.data);
    }

    async function fetchSelfStudy(currentDate) {
        const formattedDate = formatDate(currentDate);
        const res = await axios.get(`http://localhost:8000/todolist/selfstudy/${formattedDate}/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        setSelfStudy(res.data);
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const completeAssignment = async (assignmentId) => {
        const res = await axios.post(`http://localhost:8000/todolist/complete_assignments/${assignmentId}/`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (res.data) {
            fetchAssignment(currentDate);
        }
    };

    const completeSelfStudy = async (selfStudyId) => {
        const res = await axios.post(`http://localhost:8000/todolist/complete_selfstudy/${selfStudyId}/`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (res.data) {
            fetchSelfStudy(currentDate);
        }
    };

    const deleteAssignment = async (assignmentId) => {
        const res = await axios.delete(`http://localhost:8000/todolist/delete_assignments/${assignmentId}/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (res.data) {
            fetchAssignment(currentDate);
        }
    };

    const deleteSelfStudy = async (selfStudyId) => {
        const res = await axios.delete(`http://localhost:8000/todolist/delete_selfstudy/${selfStudyId}/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (res.data) {
            fetchSelfStudy(currentDate);
        }
    };

    return (
        <div className="flex">
        <SideBarComp />
        <div className={`p-4 w-full mt-[76px] ${theme === 'light' ? '' : 'bg-black text-white'}`}>
           
            <AutoClosePopup
                message="Welcome to the Practice page! Here you can manage your assignments and self-study tasks for each day. Use the buttons to add new tasks or navigate through different dates."
                isVisible={popupVisible}
                onClose={() => setPopupVisible(false)}
                showAgain={() => setPopupVisible(true)}
            />

            <header className={`flex flex-col md:flex-row items-center justify-between m-10 p-8 rounded-lg shadow-lg border-2 border-gray-200 ${theme === 'light' ? '' : 'bg-black text-white'}`}>
                <h1 className="text-2xl font-semibold font-serif mb-4 md:mb-0">{currentDate.toDateString()}</h1>
                <div className="flex items-center">
                    <button
                        onClick={handlePrevDate}
                        className="bg-orange-500 text-white p-2 rounded-full mr-3 hover:bg-orange-600 transition duration-300 ease-in-out"
                    >
                        <CiCircleChevLeft size={24} />
                    </button>
                    <button
                        onClick={handleNextDate}
                        className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition duration-300 ease-in-out"
                    >
                        <CiCircleChevRight size={24} />
                    </button>
                </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mb-4 px-10">
                <div onClick={handleAddAssignment} className="bg-gray-100 text-black p-4 rounded-xl flex items-center justify-center shadow-none transition-shadow duration-300 cursor-pointer hover:shadow-lg hover:shadow-gray-400">
                    <HiFolderPlus size={40} className="mr-4 text-blue-600" />
                    <div>
                        <h4 className="text-md font-semibold">Add Assignment</h4>
                    </div>
                </div>
                {popUpAssignment && <PopupForm1 handleClose={handleAddAssignment} onAssignmentAdded={fetchAssignment(currentDate)} />}
                <div onClick={handleAddSelfStudy} className="bg-gray-100 text-black p-4 rounded-xl flex items-center justify-center shadow-none transition-shadow duration-300 cursor-pointer hover:shadow-lg hover:shadow-gray-400">
                    <HiFolderPlus size={40} className="mr-4 text-blue-600" />
                    <div>
                        <h4 className="text-md font-semibold">Add Self Study</h4>
                    </div>
                </div>
                {popUpSelfStudy && <PopupForm handleClose={handleAddSelfStudy} onAddSelfStudy={fetchSelfStudy(currentDate)} />}
            </div>

            {/* Render Assignments */}
            <h2 className="text-xl font-semibold text-center mt-6">Assignments</h2>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mb-4 px-10">
                {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                        <AssignmentBox
                            key={assignment.id}
                            assignment={assignment}
                            onComplete={() => completeAssignment(assignment.id)}
                            onDelete={() => deleteAssignment(assignment.id)}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500">No assignments for today</p>
                )}
            </div>

            {/* Render Self Study */}
            <h2 className="text-xl font-semibold text-center mt-6">Self Study</h2>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mb-4 px-10">
                {selfStudy.length > 0 ? (
                    selfStudy.map((selfStudyItem) => (
                        <SelfStudyBox
                            key={selfStudyItem.id}
                            selfStudy={selfStudyItem}
                            onComplete={() => completeSelfStudy(selfStudyItem.id)}
                            onDelete={() => deleteSelfStudy(selfStudyItem.id)}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500">No self-study tasks for today</p>
                )}
            </div>
        </div>
    </div>);
}

export default Practice;

const AssignmentBox = ({ assignment, onComplete, onDelete }) => (
    <div className={`p-4 rounded-xl shadow-md hover:shadow-lg transition duration-500 hover:scale-110 ease-in-out ${assignment.completed ? 'bg-gradient-to-r from-green-200 to-green-400' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
        <h3 className="text-xl font-semibold text-center">{assignment.subject}</h3>
        <p className="text-lg text-white text-center mt-2">{assignment.chapter}</p>
        <div className="flex justify-between items-center mt-4">
            {assignment.completed ? (
                <span className="text-black bg-green-500 px-2 py-1 rounded-md"><IoCheckmarkDoneCircle size={35} /></span>
            ) : (
                <button onClick={onComplete} className="bg-gray-600 text-white p-2 rounded hover:bg-gray-800 transition duration-300 ease-in-out"><MdOutlineDoneOutline size={24} className="text-white" /></button>
            )}
            <button onClick={onDelete} className="bg-gray-600 text-white p-2 rounded hover:bg-gray-800 transition duration-300 ease-in-out"><MdDelete size={24} className="text-white" /></button>
        </div>
    </div>
);

const SelfStudyBox = ({ selfStudy, onComplete, onDelete }) => (
    <div className={`p-4 rounded-xl shadow-md hover:shadow-lg transition duration-500 hover:scale-110 ease-in-out ${selfStudy.completed ? 'bg-gradient-to-r from-green-200 to-green-400' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
        <h3 className="text-xl font-semibold text-center">{selfStudy.subject}</h3>
        <p className="text-lg text-white text-center mt-2">{selfStudy.chapter}</p>
        <div className="flex justify-between items-center mt-4">
            {selfStudy.completed ? (
                <span className="text-black bg-green-500 px-2 py-1 rounded-md"><IoCheckmarkDoneCircle size={35} /></span>
            ) : (
                <button onClick={onComplete} className="bg-gray-600 text-white p-2 rounded hover:bg-gray-800 transition duration-300 ease-in-out"><MdOutlineDoneOutline size={24} className="text-white" /></button>
            )}
            <button onClick={onDelete} className="bg-gray-600 text-white p-2 rounded hover:bg-gray-800 transition duration-300 ease-in-out"><MdDelete size={24} className="text-white" /></button>
        </div>
    </div>
);

import React, { useEffect, useRef, useState } from 'react';
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Import axios for making HTTP requests

const JoinCallPage = () => {
    const { roomId } = useParams();
    const mediaRecorderRef = useRef(null); // Reference to MediaRecorder
    const audioChunks = useRef([]); // Store audio chunks
    const audioUrlRef = useRef(null); // Reference to store the audio URL for playback
    const [transcription, setTranscription] = useState(""); // State to store transcription text

    const myMeeting = async (element) => {
        const appID = 752328650;
        const serverSecret = "bc3c943a1b05e2b2f9c54aeaf271da25";
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomId,
            Date.now().toString(),
            'Your name'
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
            container: element,
            scenario: {
                mode: ZegoUIKitPrebuilt.VideoConference,
            },
        });

        // Start audio recording
        startAudioRecording();
    };

    const startAudioRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data); // Collect audio data
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
                audioUrlRef.current = URL.createObjectURL(audioBlob); // Store audio URL for playback
                audioChunks.current = []; // Clear the audio chunks after playing

                // Send the audio to the server for transcription
                transcribeAudio(audioBlob);
            };

            mediaRecorderRef.current.start();
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopAudioRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop(); // Stop recording
        }
    };

    const playRecordedAudio = () => {
        if (audioUrlRef.current) {
            const audio = new Audio(audioUrlRef.current);
            audio.play(); // Play the recorded audio
        } else {
            console.log("No audio recorded yet.");
        }
    };

    const transcribeAudio = async (audioBlob) => {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav'); // Append audio file to FormData

        try {
            const response = await axios.post('http://localhost:3000/transcribe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setTranscription(response.data.text); // Set the transcription state
        } catch (error) {
            console.error('Error during transcription:', error.response ? error.response.data : error);
            res.status(500).send({ error: 'Transcription failed' });
        }        
    };

    useEffect(() => {
        return () => {
            stopAudioRecording(); // Stop recording when component unmounts
        };
    }, []);

    return (
        <div className='bg-blue-600 flex justify-center items-center'>
            <div ref={myMeeting}></div>
            <button onClick={stopAudioRecording} className='bg-green-500'>Stop Recording</button>
            <button onClick={playRecordedAudio}>Play Recorded Audio</button>
            {transcription && <div className="transcription">Transcription: {transcription}</div>}
        </div>
    );
};

export default JoinCallPage;

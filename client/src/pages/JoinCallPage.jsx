import React, { useEffect, useRef, useState } from 'react';
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ugpifdpzvmupzfdejpbv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncGlmZHB6dm11cHpmZGVqcGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwMjgzNDEsImV4cCI6MjA0MzYwNDM0MX0.0PHU_w4FXGb_TOj5wYIIAHLtT1ficXlbOWMCuc7BJdw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const JoinCallPage = () => {
    const { roomId } = useParams();
    const mediaRecorderRef = useRef(null);
    const audioChunks = useRef([]);
    const audioUrlRef = useRef(null);
    const [transcription, setTranscription] = useState("");

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

        startAudioRecording();
    };

    const startAudioRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
                audioUrlRef.current = URL.createObjectURL(audioBlob);
                audioChunks.current = [];

               // transcribeAudio(audioBlob);
                uploadAudioToSupabase(audioBlob);
            };

            mediaRecorderRef.current.start();
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopAudioRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
    };
  
    const playRecordedAudio = () => {
        if (audioUrlRef.current) {
            const audio = new Audio(audioUrlRef.current);
            audio.play();
        } else {
            console.log("No audio recorded yet.");
        }
    };

    const transcribeAudio = async (audioBlob) => {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');

        try {
            const response = await axios.post('http://localhost:3000/transcribe', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setTranscription(response.data.text);
        } catch (error) {
            console.error('Error during transcription:', error.response ? error.response.data : error);
        }
    };

    const uploadAudioToSupabase = async (audioBlob) => {
        console.log(audioBlob);
        const fileName = `public/audio-${Date.now()}.wav`; // Ensure the file path is correct
        const { data, error } = await supabase
            .storage
            .from('Audio') // Ensure the bucket name is correct
            .upload(fileName, audioBlob, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'audio/wav' // Set MIME type explicitly
            });
    
        if (error) {
            console.error('Error uploading audio to Supabase:', error.message);
        } else {
            console.log('Audio uploaded to Supabase:', data);
        }
    };
    
    

    useEffect(() => {
        return () => {
            stopAudioRecording();
        };
    }, []);

    return (
        <div className='flex flex-col justify-center items-center h-screen gap-8'>
            <div ref={myMeeting} className='p-4 rounded-xl'></div>
            <div className='flex gap-4 text-xl'>
                <button onClick={stopAudioRecording} className='bg-red-500 rounded-xl p-2'>Stop Recording</button>
                <button onClick={playRecordedAudio} className='bg-green-500 rounded-xl p-2'>Play Recorded Audio</button>
            </div>
            {transcription && <div className="transcription">Transcription: {transcription}</div>}
        </div>
    );
};

export default JoinCallPage;

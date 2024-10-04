import React, { useEffect, useRef, useState } from 'react';
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ugpifdpzvmupzfdejpbv.supabase.co';
const supabaseAnonKey = 'your_anon_key_here';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const JoinCallPage = () => {
    const { roomId } = useParams();
    const mediaRecorderRef = useRef(null);
    const audioChunks = useRef([]);
    const audioUrlRef = useRef(null);
    const [transcription, setTranscription] = useState("");
    const recognitionRef = useRef(null); // Store recognition instance
    const fullTranscriptionRef = useRef(""); // Store full transcription
    const [isTranscribing, setIsTranscribing] = useState(false); // Track transcription status

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
    
                uploadAudioToSupabase(audioBlob);
                stopSpeechRecognition(); // Stop transcription when recording stops
                setTranscription(fullTranscriptionRef.current); // Set final transcription
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

    const uploadAudioToSupabase = async (audioBlob) => {
        const fileName = `public/audio-${Date.now()}.wav`;
        const { data, error } = await supabase
            .storage
            .from('Audio')
            .upload(fileName, audioBlob, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'audio/wav'
            });
    
        if (error) {
            console.error('Error uploading audio to Supabase:', error.message);
        } else {
            console.log('Audio uploaded to Supabase:', data);
        }
    };

    // Start speech recognition using the Web Speech API
    const startSpeechRecognition = () => {
        if (!('webkitSpeechRecognition' in window)) {
            console.error("SpeechRecognition API not supported in this browser.");
            return;
        }
    
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
    
        recognition.onresult = (event) => {
            let interimTranscript = '';
    
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    fullTranscriptionRef.current += transcript + ' '; // Accumulate final transcript
                } else {
                    interimTranscript += transcript;
                }
            }
        };
    
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };
    
        recognitionRef.current = recognition;
        recognition.start();
        setIsTranscribing(true); // Mark transcription as started
    };
    
    const stopSpeechRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsTranscribing(false); // Mark transcription as stopped
            console.log("Final Transcription:", fullTranscriptionRef.current);

        }
    };

    useEffect(() => {
        return () => {
            stopAudioRecording();
            stopSpeechRecognition();
        };
    }, []);

    return (
        <div className='flex flex-col justify-center items-center h-screen gap-8'>
            <div ref={myMeeting} className='h-full w-full rounded-xl'></div>
            {/* <div className='flex gap-4 text-xl'>
                <button onClick={stopAudioRecording} className='bg-red-500 rounded-xl p-2'>Stop Recording</button>
                <button onClick={playRecordedAudio} className='bg-green-500 rounded-xl p-2'>Play Recorded Audio</button>
            </div> */}
            {transcription && <div className="transcription">Transcription: {transcription}</div>}
        </div>
    );
};

export default JoinCallPage;

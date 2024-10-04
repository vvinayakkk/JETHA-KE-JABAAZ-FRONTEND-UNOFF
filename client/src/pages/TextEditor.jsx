import React, { useCallback, useEffect, useRef, useState } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import {io} from 'socket.io-client'
import { useParams } from 'react-router-dom'

const TOOLBAR_OPTIONS=[
  [{header:[1,2,3,4,5,,false]}],
  [{font:[]}],
  [{list:"ordered"},{list:"bullet"}],
  ["bold","italic","underline"],
  [{color:[]},{background:[]}],
  [{script:"sub"},{script:"super"}],
  [{align:[]}],
  ["image","blockquote","code-block"],
  ["clean"],
]
const SAVE_INTERVAL_MS = 2000;
const TextEditor = () => {
  const {id:documentId} = useParams();
  const [socket,setSocket] = useState();
  const [quill,setQuill] = useState();

  // const wrapperRef = useRef();
  // useEffect(()=>{
  //   const editor = document.createElement('div');
  //   wrapperRef.current.append(editor);
  //   new Quill(editor,{theme:"snow"})

      // return ()=>{
      //   wrapperRef.innerHTML= ""
      // }
  // },[])
  // issue with above is that sometimes the useeffect gets called even before the useRef is declared and that will give an error
  // so we use the callback function of useRef to get the current value of the ref
  // we can't use the return thing in the call back so instead at the start of the function we clear the innerHTML

  const wrapperRef = useCallback((wrapper)=>{
    if(wrapper==null) return;
    wrapper.innerHTML = ''
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, { theme: "snow",modules:{toolbar:TOOLBAR_OPTIONS}});
    setQuill(q);
    q.disable();
    q.setText('Loading...')
  },[])

  useEffect(()=>{
    const s = io("http://localhost:3500");
    setSocket(s);
    return ()=>{
      s.disconnect();
    }
  },[])

  useEffect(()=>{
    if(socket == null || quill == null) return ;
    const handler = (delta,oldDelta,source)=>{
      if(source!=='user') return; // this is because if we make a change then we will be sending that change through some api and the cource of changes in other persons doc is not a user but maybe api
      socket.emit("send-changes",delta);
    };
    quill.on('text-change',handler);
    return ()=>{
      quill.off('text-change',handler)
    }
  },[socket,quill])

  useEffect(()=>{
    if(socket==null || quill == null) return;
    socket.once("load-document",document=>{
      quill.setContents(document);
      quill.enable();
    })
    socket.emit('get-document',documentId);
  },[socket,quill,documentId])

  useEffect(()=>{
    if(socket==null || quill == null) return
    const interval = setInterval(()=>{
      socket.emit("save-document",quill.getContents())
    },SAVE_INTERVAL_MS)
    return ()=>{
      clearInterval(interval);
    }
  },[socket,quill])
  useEffect(()=>{
    if(socket == null || quill == null) return ;

    const handler = (delta)=>{
      quill.updateContents(delta);
    };
    socket.on("receive-changes",handler);
    return ()=>{
      socket.off('receive-changes',handler)
    }
  },[socket,quill])

  return (
    // this is done since if we don't do this then new text editors will keep getting added on reloading
    <div className="container" ref={wrapperRef}> 
      TextEditor
    </div>
  )
}

export default TextEditor

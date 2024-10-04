import React from 'react'

import { SparklesPreview } from './Preview'
import { CanvasRevealEffectDemo } from './ChamkilaCards'
import { InfiniteMovingCardsDemo } from './ReviesMoving'
import { FloatingNavDemo } from './Navbar'
import { FlipWordsDemo } from './FlippinWords'

const Hero = () => {
  return (
    <main className='bg-black w-screen h-screen overflow-x-hidden'>
      <FloatingNavDemo />
      <div className='bg-black items-center justify-center'>
        <SparklesPreview />
      </div>
      <div className='w-screen h-screen bg-black mt-32 items-center justify-center'>
        <h1 className='text-purple-600 text-3xl font-bold ml-20'>Navigate Your Future with Confidence 🚀</h1>
        <CanvasRevealEffectDemo />
      </div>
      <div className='mt-[-1]'> {/* Reduced the negative margin */}
        <InfiniteMovingCardsDemo />
        {/* <FlipWordsDemo /> */}
      </div>
    </main>
  )
}

export default Hero;

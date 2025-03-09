import React from 'react';
import Header from '../signin/_header';
import style from '../signin/page.module.css';
import InstallForm from './installForm';
import classNames from '@/utils/classnames';

const Install = () => {
  return (
    <div className={classNames(
      style.background,
      'flex w-full min-h-screen',
      'sm:p-4 lg:p-8',
      'gap-x-20',
      'justify-center lg:justify-start',
    )}>
      <div className={
        classNames(
          'flex w-full flex-col bg-white shadow rounded-2xl shrink-0',
          'space-between',
        )
      }>
        <Header />
        <div className={
          classNames(
            'flex flex-col items-center w-full grow justify-center',
            'px-6',
            'md:px-[108px]',
          )
        }>
          <div className='flex flex-col md:w-[400px]'>
            <InstallForm />
          </div>
        </div>
        <div className='px-8 py-6 system-xs-regular text-text-tertiary'>
          Welcome to LamaPBX
        </div>
      </div>
    </div>
  )
}

export default Install;
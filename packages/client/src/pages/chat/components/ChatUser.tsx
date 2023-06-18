import React, { useState } from 'react'

export const ChatUser = () => {
  const [activeButton, setActiveButton] = useState<number>(2)

  const handleButtonClick = (buttonId: number) => {
    setActiveButton(buttonId)
  }
  const Users: { name: string; subtitle: string; lastsent: string }[] = [
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' }
  ]

  return (
    <div className="w-[320px] h-[70vh] overflow-scroll hide-scroll mt-[8px]">
      <div className="w-[320px] mb-[42px] flex flex-wrap gap-[0.5px]">
        {Users.map((item, index) => {
          return (
            <>
              <div
                className={`w-[320px] h-[68px] flex flex-wrap mx-4 gap-1 justify-center rounded-[5px] ${
                  activeButton === index ? 'bg-[#D4D7DC]' : ''
                }`}
                onClick={() => handleButtonClick(index)}
              >
                <div className="w-[230px] flex flex-wrap gap-5 justify-start">
                  <img className="mt-3 rounded-8xs w-11 h-11 object-cover" alt="" src="/icon-user.png" />
                  <div className="mt-3 justify-start">
                    <p className="font-bold text-[#3F3960]">{item.name}</p>
                    <p className="h-4 text-xs text-[#787589]">{item.subtitle}</p>
                  </div>
                </div>
                <div className="">
                  <p className="mt-3 h-4 text-xs text-[#787589]">{item.lastsent}</p>
                </div>
              </div>
            </>
          )
        })}
      </div>
    </div>
  )
}

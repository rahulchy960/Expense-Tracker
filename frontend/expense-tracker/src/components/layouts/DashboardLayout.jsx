import React, { useContext } from 'react'
import { userContext } from "../../context/userContext";
import Navbar from './Navbar';
import SideMenu from './SideMenu';

export const DashboardLayout = ({children, activeMenu}) => {
  const { user } = useContext(userContext);
  return (
    <div>
      <div className=''>
        <Navbar activeMenu={activeMenu} />
        { user && (
          <div className='flex'>
            <div className='max-[1080px]:hidden'>
              <SideMenu activeMenu={activeMenu} />
            </div>
            <div className='grow mx-5'>
              { children }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import React from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import "./NotFound.css"
import { useNavigate} from 'react-router-dom'
import {IoHomeSharp} from "react-icons/io5"

export default function NotFound() {
    const navigate = useNavigate()
    const onClick = ()=>{
        navigate('/')
    }
    return (
        <div className='c'>
            <div className='abs-center'>
                <h1 className='text-danger'>Error 404</h1>
                <h1 className='text-danger'>Page not found</h1>
                <br/>
                <button className='btn btn-outline-primary btn-lg w-100'
                 onClick={onClick}>
                <IoHomeSharp className='icon' />  Return Home</button>
            </div>
        </div>
    )
}
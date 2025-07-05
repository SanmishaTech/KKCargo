import React from "react";
import Notfounditem from "./images/404page.png";
import Newori from "./images/neworig2.png";
import { useNavigate } from "@tanstack/react-router";

const Notfound = () => {
  const navigate = useNavigate();
  return (
    <div className="h-[100vh] flex flex-col items-center justify-end ">
      <div className="flex justify-center items-center">
        <img src={Notfounditem} alt="404" />
      </div>
      <div className=" flex flex-col justify-center">
        <h1 className="text-center text-3xl font-light p-4 font-lato">
          Looks like this page does not exist!
        </h1>
        <h5 className="text-center font-lato text-gray-700">
          Go back to home and Continue exploring!
        </h5>
        <div className=" flex justify-center">
          <button
            onClick={() => navigate({ to: "/staff" })}
            className="bg-black/75 text-white font-bold py-3 px-6 rounded-[1rem] mt-6 "
          >
            Back to home
          </button>
        </div>
      </div>
      <div className="justify-self-end self-end">
        <img src={Newori} alt="404" />
      </div>
    </div>
  );
};

export default Notfound;

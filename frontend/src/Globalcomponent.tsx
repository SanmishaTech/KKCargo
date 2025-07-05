import React from "react";
import cat505 from "./images/cat505.png";
const Globalcomponent = () => {
  return (
    <div className=" w-full ml-8 flex flex-col items-center justify-center h-[95%]">
      <div className="w-[50%] flex justify-center items-center ">
        <img src={cat505} alt="505" className="w-full ml-auto mr-auto" />
      </div>
      <h1 className="text-4xl text-blue-500 font-black mb-2 mt-2">
        Sorry, Unexpected Error Occurred
      </h1>
      <h4 className="text-gray-400">
        We are working on fixing the problem, Be back soon.
      </h4>
    </div>
  );
};

export default Globalcomponent;

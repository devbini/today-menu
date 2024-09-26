import React from "react";
import Image from "next/image";
import "../css/contect.css";

interface contectprob {}

// Function Component (FC)
const Contect: React.FC<contectprob> = ({}) => {
  const F_Onlick = () => {
    alert("리뷰!");
  };

  return (
    <div className="contect-root">
      <Image
        src="./prob/contect_img"
        alt="Contect"
        className="contect-class"
        width={800}
        height={800}
        onClick={() => F_Onlick()}
      ></Image>
    </div>
  );
};

export default Contect;

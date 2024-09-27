import React from "react";
import Image from "next/image";
import "../css/contect.css";

interface contectprob {}

// Function Component (FC)
const Contect: React.FC<contectprob> = ({}) => {
  const F_Onlick = () => {
    window.open("https://forms.gle/tWHsLL7B8JGie18K9", "_blank");
  };

  return (
    <div className="contect-root">
      <Image
        src="/prob/contect_img.png"
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

/********************************************************************

# 구내식당 메뉴 미리보기 서비스 #
# 작성자 : 김찬빈 (Kim Chan Been, https://github.com/devbini)

# contect.tsx 파일 역할
# 1. 구글 폼으로 연결하는 버튼 추가

*********************************************************************/

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

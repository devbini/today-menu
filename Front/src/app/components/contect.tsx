/********************************************************************

# 구내식당 메뉴 미리보기 서비스 #
# 작성자 : 김찬빈 (Kim Chan Been, https://github.com/devbini)

# contect.tsx 파일 역할
# 1. 구글 폼으로 연결하는 버튼 추가
# 2. 레포로 연결하는 버튼 추가

*********************************************************************/

import React from "react";
import "../css/contect.css";
import { AiFillGithub } from "react-icons/ai";
import { SiGoogleforms } from "react-icons/si";

interface contectprob {}

const Contect: React.FC<contectprob> = ({}) => {
  const F_Onlick = () => {
    window.open("https://forms.gle/tWHsLL7B8JGie18K9", "_blank");
  };

  const G_Onlick = () => {
    window.open("https://github.com/devbini/today-menu", "_blank");
  };

  return (
    <div className="contect-root">
      <button
        className="contect-button"
        onClick={() => F_Onlick()}
        aria-label="문의하기 (새 창 열림)"
      >
        <SiGoogleforms size="1.75rem" />
      </button>

      <button
        className="contect-button github"
        onClick={() => G_Onlick()}
        aria-label="GitHub 저장소 (새 창 열림)"
      >
        <AiFillGithub size="1.75rem" />
      </button>
    </div>
  );
};

export default Contect;

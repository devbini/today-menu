/********************************************************************

# 구내식당 메뉴 미리보기 서비스 #
# 작성자 : 김찬빈 (Kim Chan Been, https://github.com/devbini)
# 코드 작성 날짜 (업데이트 날짜) : 2024-08-19

# adminpage.tsx 파일 역할
# 1. 관리자가 데이터를 서버에 업로드하는 역할
# 2. 텍스트와 이미지 파일 데이터를 POST 형식으로 Backend로 전달함

*********************************************************************/

import React, { useState } from "react";
import LoginPage from "./loginpage";

// 함수형 컴포넌트의 매개변수 전용
interface AdminpageProps {
    onClose: () => void;
}

// Function Component (FC)
const AdminPage: React.FC<AdminpageProps> = ({ onClose }) => {
    // 로그인 여부 저장
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    // 서버에 업로드할 정보 저장
    const [file, setFile] = useState<File | null>(null);// 이미지 파일
    const [text1, setText1] = useState<string>("");     // 사이드메뉴

    // 파일 업로드
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // 파일 타입 확인
            if (selectedFile.type.startsWith('image/')) {
                setFile(selectedFile);
            } else {
                alert('이미지 파일만 업로드할 수 있습니다.');
                setFile(null);
            }
        }
    };

    // 데이터 업로드 시도 (POST)
    const handleSubmit = () => {
        if (file) {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("side", text1);

            // Backend 구축 必
            fetch("http://3.36.142.196:9091/api/upload", {
                method: "POST",
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Success:", data);
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        } else {
            alert("사진이 업로드 되지 않았습니다!");
        }
    };

    // 로그인 성공 체크
    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    const handleCloseLoginbox = () => {
        onClose();
    }

    // 로그인 성공하면 로그인 팝업 삭제
    if (!isLoggedIn) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} onClose={handleCloseLoginbox} />;
    }

    // HTML
    return (
        <div className="popup-container">
            <div className="popup-card">
                <h2>어서오세요 관리자님!</h2>
                <h3>메뉴 사진과 사이드메뉴 이름을 남겨주세요!</h3>
                <input type="file" onChange={handleFileChange} accept="image/*" />
                <input
                    type="text"
                    placeholder="사이드 메뉴 이름"
                    value={text1}
                    onChange={(e) => setText1(e.target.value)}
                />
                <button onClick={handleSubmit}>저장</button>
                <button className="popup-close" onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default AdminPage;

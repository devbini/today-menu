/********************************************************************

# 구내식당 메뉴 미리보기 서비스 #
# 작성자 : 김찬빈 (Kim Chan Been, https://github.com/devbini)

# adminpage.tsx 파일 역할
# 1. 관리자가 데이터를 서버에 업로드하는 역할
# 2. 텍스트와 이미지 파일 데이터를 POST 형식으로 Backend로 전달함

*********************************************************************/

import React, { useState } from "react";
import LoginPage from "./loginpage";

// 함수형 컴포넌트의 매개변수 전용
interface AdminpageProps {
    onClose: () => void;
    onUploadSuccess: () => void;
}

// Function Component (FC)
const AdminPage: React.FC<AdminpageProps> = ({ onClose, onUploadSuccess }) => {
    // 로그인 여부 저장
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    // 서버에 업로드할 정보 저장
    const [file, setFile] = useState<File | null>(null); // 이미지 파일
    const [text1, setText1] = useState<string>("");      // 사이드메뉴
    const [loading, setLoading] = useState<boolean>(false); // 로딩 상태

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
            setLoading(true); // 로딩 상태 시작
            const formData = new FormData();
            formData.append("image", file);
            formData.append("side", text1);

            if (!localStorage.getItem('csrfToken')) {
                alert("CSRF 토큰이 없습니다. 다시 로그인 해 주세요.");
                setLoading(false);
                return;
            }

            fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                method: "POST",
                headers: {
                    "CSRF-Token": `${localStorage.getItem('csrfToken')}`
                },
                body: formData,
                credentials: 'include',
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Success:", data);
                    setLoading(false);
                    alert("업로드가 성공적으로 완료되었습니다!");
                    onUploadSuccess();
                    onClose();
                })
                .catch((error) => {
                    console.error("Error:", error);
                    setLoading(false);
                    alert("업로드 중 오류가 발생했습니다.");
                });
        } else {
            alert("사진이 업로드 되지 않았습니다!");
        }
    };

    // 로그인 성공 체크
    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    // 로그인되지 않은 경우 로그인 페이지 표시
    if (!isLoggedIn) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} onClose={onClose}/>;
    }

    // HTML
    return (
        <div className="popup-container">
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-message">업로드 중입니다. 잠시만 기다려주세요...</div>
                </div>
            )}
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
                <button onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default AdminPage;

/********************************************************************

# 구내식당 메뉴 미리보기 서비스 #
# 작성자 : 김찬빈 (Kim Chan Been, https://github.com/devbini)
# 코드 작성 날짜 (업데이트 날짜) : 2024-08-19

# loginpage.tsx 파일 역할
# 1. 관리자가 서버에 데이터를 업로드하기 전 로그인을 하는 단계.
# 2. POST 형식으로 ID/PW를 전달하고 전달받음. "1"이 돌아오면 로그인 성공

*********************************************************************/

import React, { useState } from "react";

// 함수형 컴포넌트의 매게변수 전용
interface LoginPageProps {
    onLoginSuccess: () => void;
}

// Function Component (FC)
const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    // 입력 정보 저장
    const [id, setId] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    // 로그인 시도
    const handleLogin = () => {
        fetch("http://3.36.142.196:9091/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id,
                pw: password,
            }),
        })
            .then((response) => response.json())
            .then((result) => {
                // Return이 1인 경우 로그인 성공으로 간주
                if (result.message === "1") {
                    onLoginSuccess();
                } else {
                    alert("아이디 혹은 비밀번호가 틀렸습니다!");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    // HTML
    return (
        <div className="login-container">
            <div className="login-card">
                <h2>관리자 로그인</h2>
                <input
                    type="text"
                    placeholder="ID"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleLogin}>로그인</button>
            </div>
        </div>
    );
};

export default LoginPage;

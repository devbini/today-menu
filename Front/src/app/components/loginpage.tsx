/********************************************************************

# 구내식당 메뉴 미리보기 서비스 #
# 작성자 : 김찬빈 (Kim Chan Been, https://github.com/devbini)
# 코드 작성 날짜 (업데이트 날짜) : 2024-08-19

# loginpage.tsx 파일 역할
# 1. 관리자가 서버에 데이터를 업로드하기 전 로그인을 하는 단계.
# 2. POST 형식으로 ID/PW를 전달하고 전달받음. "1"이 돌아오면 로그인 성공

*********************************************************************/

import React, { useEffect, useRef, useState } from "react";

// 함수형 컴포넌트의 매게변수 전용
interface LoginPageProps {
    onLoginSuccess: () => void;
    onClose: () => void;
}

// Function Component (FC)
const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onClose }) => {
    // 입력 정보 저장
    const [id, setId] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [csrfToken, setCsrfToken] = useState<string>("");
    const hasFetchedCsrfToken = useRef(false);  // CSRF 토큰을 이미 요청했는지 여부 저장

    // CSRF 토큰을 페이지가 로드될 때 한 번 받아옴
    useEffect(() => {
        if (hasFetchedCsrfToken.current) return;
        hasFetchedCsrfToken.current = true;
        alert("A");
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/csrf-token`, {
            method: 'GET',
            credentials: 'include', // 쿠키 전송 설정
        })
            .then((response) => response.json())
            .then((data) => {
                setCsrfToken(data.csrfToken);
            })
            .catch((error) => {
                console.error("CSRF 토큰 요청 에러:", error);
            });
    }, []);

    // 로그인 시도
    const handleLogin = () => {
        if (!csrfToken) {
            alert("CSRF 토큰이 없습니다.");
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "CSRF-Token": csrfToken, // 미리 받아온 CSRF 토큰 사용
            },
            credentials: 'include', // 쿠키 전송 설정
            body: JSON.stringify({
                id: id,
                pw: password,
            }),
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("로그인 실패: 잘못된 응답");
        })
        .then((result) => {
            if (result.token) {
                // 로그인 성공 시 토큰을 로컬 스토리지 또는 쿠키에 저장
                localStorage.setItem("token", result.token);
                onLoginSuccess();
            } else {
                alert("아이디 또는 비밀번호가 잘못되었습니다.");
            }
        })
        .catch((error) => {
            console.error("로그인 에러:", error);
            alert("로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
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
                <button onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default LoginPage;

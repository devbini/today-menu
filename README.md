# 🥘 구내식당 메뉴 미리보기 웹 서비스

## 👏 소개
>
> 구내식당 미리보기 서비스는 사옥 내 **구내식당의 메뉴를 미리 확인하지 못하는 불편함을 해소하기 위해** 개발된 서비스입니다.  
> 이 서비스는 **식당 측에서 간편하게 메뉴를 관리할 수 있도록**,  
> 간단히 사진 한 장과 사이드 메뉴 이름만 저장할 수 있게 설계되었습니다.

## 🚀 접속 주소
- **Production URL : https://woorung.kr/**
---
## ✨ 주요 기능

* **사용자 (User)**
    * 오늘의 메뉴 (사진, 사이드 메뉴) 확인
    * 방문자 수 확인
    * 메뉴 리뷰 작성 및 별점 평가
    * 전체 리뷰 목록 조회
    * 피드백 제출 (Google Forms)

* **관리자 (Admin)**
    * 관리자 전용 로그인 (With CSRF & JWT)
    * 오늘의 메뉴 업로드 (이미지 + 텍스트)
---

## 🛠️ 기술 스택

### 1. 프론트엔드 (Frontend)
* **Framework:** Next.js (React / TypeScript)
* **Styling:** CSS
* **Icons:** `react-icons`

### 2. 백엔드 (Backend)
* **Framework:** Node.js, Express
* **Authentication:** `JWT`, `bcryptjs`
* **Security:** `csurf`, `xss-clean`, `cors`

### 3. 인프라 (Infrastructer) -> AWS에서 Azure로 이전 됨.
* **Hosting:** Azure App Service
* **File Storage:** Azure Blob Storage (`@azure/storage-blob`)
* **Database:** Azure Database for MySQL

### 4. 아키텍쳐 소개
<img alt="image" src="https://github.com/user-attachments/assets/e97efabb-5ec4-47be-9ddb-8e6ff2af5562" />

---

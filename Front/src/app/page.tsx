/********************************************************************

  # 구내식당 메뉴 미리보기 서비스 #
  # 작성자 : 김찬빈 (Kim Chan Been, https://github.com/devbini)
  # 코드 작성 날짜 (업데이트 날짜) : 2024-08-19

  # page.tsx 파일 역할
  # 1. 사용자가 마주하는 첫 화면
  # 2. 오늘의 메뉴를 바로 보여줌

*********************************************************************/

"use client";

// lib list
import { useEffect, useState } from "react";
import Head from "next/head";
import Adminpage from "./components/adminpage";
import Contectmenu from "./components/contect";

// CSS
import "./css/page.css";
import "./css/adminpage.css";
import "./css/contect.css";
import ReviewPopup from "./components/reviewpage";

interface Data {
  url: string;
  date: string;
  side: string;
}

interface Review {
  message: string;
  date: string;
  rate: number;
}

export default function Home() {
  // 데이터 저장 및 에러 내용 저장
  const [server_data, setData] = useState<Data | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [review_data, setReview_Data] = useState<Review[]>([]);

  // 이미지 URL 상태
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  // 관리자 전용 팝업 ON / OFF용 변수&함수
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  // 리뷰 전용 팝업
  const [isReviewPopupOpen, setIsReviewPopupOpen] = useState<Boolean>(false);

  // 입력 리뷰
  const [message, setmessage] = useState("");
  const [rating, setRating] = useState(5);

  // 접속자 카운드
  const [visitcount, setvisitcount] = useState(0);

  const handlePopupOpen = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  const handleReviewPopupOpen = () => {
    setIsReviewPopupOpen(true);
  };

  const handleReviewPopupClose = () => {
    setIsReviewPopupOpen(false);
  };

  // 로딩 화면
  const [loading, setLoading] = useState<boolean>(true);

  // 웹 접속 시 처음 한 번 실행하는 함수,
  // Back으로부터 s3의 데이터를 받아 실행합니다.
  const fetchData = () => {
    setLoading(true);
    fetch(process.env.NEXT_PUBLIC_API_URL + "/getdatas")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.toString());
        setLoading(false);
      });
  };

  // 카운트 읽기 함수
  const getVisitCount = () => {
    fetch(process.env.NEXT_PUBLIC_API_URL + "/visitCount")
      .then((response) => response.json())
      .then((data) => {
        setvisitcount(data.count);
      })
      .catch((error) => {
        setError(error.toString());
      });
  };

  const getReviewData = () => {
    fetch(process.env.NEXT_PUBLIC_API_URL + "/getreviews")
      .then((response) => response.json())
      .then((data: Review[]) => {
        setReview_Data(data);
      })
      .catch((error) => {
        console.error("리뷰 데이터 가져오기 오류:", error);
      });
  };

  // 방문자 수 증가
  const handleVisitUpdate = () => {
    const formData = new FormData();

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/incrementVisitCount`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("방문자 수 증가 완료!");
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("등록 중 오류가 발생했습니다.");
      });

    getVisitCount();
  };

  // 페이지 로드시 데이터 가져오기
  useEffect(() => {
    fetchData();
    getReviewData();
    handleVisitUpdate();
  }, []);

  // 값이 정상적으로 들어왔는지 확인합니다.
  useEffect(() => {
    if (server_data) {
      setLoading(false);
      if (!imageUrl) {
        const imgUrl = `https://woorung.kr${server_data.url.replace(
          "/var/www",
          ""
        )}?timestamp=${new Date().getTime()}`;
        setImageUrl(imgUrl);
        setLoading(false);
      }
    }
  }, [server_data]);

  // HTML
  return (
    <>
      {/* SSO 추가 */}
      <Head>
        <title>오늘의 우렁각시 메뉴</title>
        <meta
          name="description"
          content="🚗 오늘의 우렁각시 메뉴를 확인하세요!"
        />
      </Head>

      <Contectmenu />

      {/* 메인 페이지 */}
      <div className="container">
        <div className="main-box-1">
          <span className="title-box-with-admin-button">
            오늘의 우렁각시 메뉴
            <button className="admin-button" onClick={handlePopupOpen}>
              관리자 전용
            </button>
          </span>

          {loading ? (
            <p>데이터를 불러오는 중입니다. . .</p>
          ) : error ? (
            <p>{error}</p>
          ) : server_data ? (
            <div className="menu-card">
              <img src={imageUrl} alt="오늘의 메뉴" />
              <p className="date">{server_data.date.substring(0, 10)}</p>
              <p className="side">사이드 : {server_data.side}</p>
            </div>
          ) : null}
        </div>

        {/* 리뷰 페이지 */}
        <div className="review-column">
          <span className="visit-counter">오늘의 방문자 수 : {visitcount}</span>
          <h2>리뷰 작성하기</h2>

          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className="star"
                style={{ color: star <= rating ? "#ffc107" : "#ccc" }}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>

          {/* 리뷰 작성 인풋 */}
          <div className="review-input">
            <input
              value={message}
              onChange={(e) => setmessage(e.target.value)}
              type="text"
              placeholder="리뷰를 입력하세요!"
            />
            <button onClick={handleReviewPopupOpen}>전송</button>
          </div>

          {/* 리뷰 목록 */}
          <ul className="review-list">
            {review_data &&
              review_data.map(
                (
                  review: { message: string; date: string; rate: number },
                  index: number
                ) => (
                  <li className="review-item" key={index}>
                    <div className="review-content">
                      <div className="review-rating">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            style={{
                              color: i < review.rate ? "#ffc107" : "#ccc",
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {review.message}
                    </div>
                    <div className="review-date">{review.date}</div>
                  </li>
                )
              )}
          </ul>
        </div>
      </div>

      {/* 관리자 전용 팝업 페이지 제공 */}
      {isPopupOpen && (
        <Adminpage onClose={handlePopupClose} onUploadSuccess={fetchData} />
      )}

      {/* 리뷰 팝업 페이지 제공 */}
      {isReviewPopupOpen && (
        <ReviewPopup
          onClose={handleReviewPopupClose}
          onUploadSuccess={getReviewData}
          reviewMessage={message}
          reviewRating={rating}
        />
      )}
    </>
  );
}

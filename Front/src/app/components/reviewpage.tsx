/********************************************************************

# 구내식당 메뉴 미리보기 서비스 #
# 작성자 : 김찬빈 (Kim Chan Been, https://github.com/devbini)

# reviewpage.tsx 파일 역할
# 1. 리뷰 등록 재확인

*********************************************************************/

import React from "react";

interface ReviewPopupProps {
  onClose: () => void;
  onUploadSuccess: () => void;
  reviewMessage: string;
  reviewRating: number;
}

const ReviewPopup: React.FC<ReviewPopupProps> = ({
  onClose,
  onUploadSuccess,
  reviewMessage,
  reviewRating,
}) => {
  // 데이터 업로드 시도 (POST)
  const handleSubmit = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploadReview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: reviewMessage,
        rating: reviewRating.toString(),
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        onUploadSuccess();
        onClose();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("등록 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className="popup-container">
      <div className="popup-card">
        <h2>리뷰를 등록하시겠습니까?</h2>
        <h3>등록 후에는 수정/삭제가 불가능합니다.</h3>

        {/* 리뷰 내용 및 평점 확인 영역 */}
        <div className="review-item">
          <div className="review-rating">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                style={{ color: i < reviewRating ? "#ffc107" : "#ccc" }}
              >
                ★
              </span>
            ))}
          </div>
          <div className="review-content">{reviewMessage}</div>
        </div>

        <button onClick={handleSubmit}>등록</button>
        <button onClick={onClose}>취소</button>
      </div>
    </div>
  );
};

export default ReviewPopup;

/**************************************

  # 구내식당 메뉴 미리보기 서비스 #
  # 작성자 : 김찬빈 (Kim Chan Been, https://github.com/devbini)
  # 코드 작성 날짜 (업데이트 날짜) : 2024-08-16

  # 파일 역할
  # 1. 사용자가 마주하는 첫 화면
  # 2. 오늘의 메뉴를 바로 보여줌

***************************************/

'use client'

import { useEffect, useState } from 'react';

interface Data {
  URL: string;
  DATE: string;
  SIDE: string;
}

export default function Home() {
  // 데이터 저장 및 에러 내용 저장
  const [data, setData] = useState<Data | undefined>();
  const [error, setError] = useState<string | undefined>();
  
  // 로딩 화면
  const [loading, setLoading] = useState<boolean>(true);

  // 웹 접속 시 처음 한 번 실행하는 함수,
  // Back으로부터 s3의 데이터를 받아 실행합니다.
  useEffect(() => {
    fetch('http://3.36.142.196:9091/api/getdatas')
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error :', error);
        setError('데이터를 읽는데 문제가 발생했습니다.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <h1>오늘의 우령각시 메뉴</h1>
      {loading ? (
        <p>데이터를 불러오는 중입니다. . .</p>
      ) : error ? (
        <p>{error}</p>
      ) : data ? (
        <div className="menu-card">
          <img src={data.URL} alt="오늘의 메뉴" />
          <p>{data.DATE}</p>
          <p>사이드: {data.SIDE}</p>
        </div>
      ) : null}
    </div>
  );
}

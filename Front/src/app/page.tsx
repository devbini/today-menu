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
import Head from 'next/head';
import './css/page.css';

interface Data {
  url: string;
  date: string;
  side: string;
}

export default function Home() {
  // 데이터 저장 및 에러 내용 저장
  const [server_data, setData] = useState<Data | undefined>();
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
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);
  
  // 값이 정상적으로 들어왔는지 확인합니다.
  useEffect(() => {
    if (server_data) {
      console.log('🚲 DEBUG : ', server_data);
      setLoading(false);
    }
  }, [server_data]);

  return (
    <>
      {/* SSO 추가 */}
      <Head>
        <title>오늘의 우렁각시 메뉴</title>
        <meta name="description" content="🚗 오늘의 우렁각시 메뉴를 확인하세요!" />
      </Head>

      {/* 메인 페이지 */}
      <div className="container">
        <h1>오늘의 우렁각시 메뉴</h1>
        
        {loading ? (
          <p>데이터를 불러오는 중입니다. . .</p>
        ) : error ? (
          <p>{error}</p>
        ) : server_data ? (
          <div className="menu-card">
            <img
              src={server_data && server_data.url ? `http://3.36.142.196${server_data.url.replace('/var/www', '')}` : ''}
              alt="오늘의 메뉴"
            />
            <p className='date'>{server_data.date.substring(0, 10)}</p>
            <p className='side'>사이드 : {server_data.side}</p>
          </div>
        ) : null}
      </div>
    </>
  );
}

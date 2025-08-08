import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import '../Styles/Allnews.css'; // Importing the CSS file
import Cardcontent from './Cardcontent';
import Loader from './Loader';

function Allnews() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  function handlePrev() {
    setPage(page - 1);
  }

  function handleNext() {
    setPage(page + 1);
  }

  const pageSize = 12;

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ALL_NEWS}?page=${page}&pageSize=${pageSize}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok');
      })
      .then(myJson => {
        if (myJson.success) {
          setTotalResults(myJson.data.totalResults);
          setData(myJson.data.articles);
        } else {
          setError(myJson.message || 'An error occurred');
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setError('Failed to fetch news. Please try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [page, pageSize]);

  return (
    <>
      <div className='All'>

        {error && <div className="text-red-500 mb-4">{error}</div>}


        <div className='cards'>
          {!isLoading ? data.map((element, index) => (
            <Cardcontent
              title={element.title}
              description={element.description}
              imgUrl={element.urlToImage}
              publishedAt={element.publishedAt}
              url={element.url}
              author={element.author}
              source={element.source.name}
              key={index}
            />
          )) : <Loader />}
        </div>

        {!isLoading && data.length > 0 && (
          <div className="pagination">
            <button disabled={page <= 1} className='pagination-btn' onClick={handlePrev}>&larr; Prev</button>
            <p>{page} of {Math.ceil(totalResults / pageSize)}</p>
            <button className='pagination-btn' disabled={page >= Math.ceil(totalResults / pageSize)} onClick={handleNext}>Next &rarr;</button>
          </div>
        )}
      </div>
    </>
  );
}

export default Allnews;

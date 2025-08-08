import { useState, useEffect, useCallback } from "react";
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faShare, faBookmark } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular, faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import '../Styles/Cardcontent.css'; // Import the CSS file

function Card(props) {
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const loadArticleData = useCallback(async () => {
    try {
      const encodedUrl = encodeURIComponent(props.url);
      const headers = isAuthenticated() ? getAuthHeaders() : {};

      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ARTICLE_DATA}/${encodedUrl}`, {
        headers
      });

      if (response.data.success) {
        setLikeCount(response.data.likeCount);
        setCommentCount(response.data.commentCount);
        setComments(response.data.comments);
        setLiked(response.data.userLiked);
      }
    } catch (error) {
      console.error('Error loading article data:', error);
      // Set default values if there's an error
      setLikeCount(0);
      setCommentCount(0);
      setComments([]);
      setLiked(false);
    }
  }, [props.url, isAuthenticated, getAuthHeaders]);

  // Load article data on component mount
  useEffect(() => {
    loadArticleData();
  }, [loadArticleData]);

  const handleLike = async () => {
    if (!isAuthenticated()) {
      alert('Please login to like articles');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.ARTICLE_LIKE}`, {
        url: props.url,
        title: props.title,
        description: props.description,
        imageUrl: props.imgUrl,
        source: props.source,
        author: props.author,
        publishedAt: props.publishedAt
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setLiked(response.data.liked);
        setLikeCount(response.data.likeCount);
      }
    } catch (error) {
      console.error('Error liking article:', error);
      alert('Error processing like. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated()) {
      alert('Please login to bookmark articles');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.ARTICLE_BOOKMARK}`, {
        url: props.url,
        title: props.title
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setBookmarked(response.data.bookmarked);
      }
    } catch (error) {
      console.error('Error bookmarking article:', error);
      alert('Error processing bookmark. Please try again.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: props.title,
        text: props.description,
        url: props.url,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(props.url);
      alert('Link copied to clipboard!');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      alert('Please login to comment on articles');
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.ARTICLE_COMMENT}`, {
        url: props.url,
        title: props.title,
        description: props.description,
        imageUrl: props.imgUrl,
        source: props.source,
        author: props.author,
        publishedAt: props.publishedAt,
        text: newComment.trim()
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setComments([...comments, response.data.comment]);
        setCommentCount(response.data.commentCount);
        setNewComment("");
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="everything-card">
      <div className="everything-card-content">
        <b className="title">{props.title}</b>
        <div className="everything-card-img-container">
          <img className="everything-card-img" src={props.imgUrl} alt="img" />
        </div>
        <div className="description">
          <p className="description-text">
            {props.description?.substring(0, 200)}
          </p>
        </div>

        {/* Social Actions */}
        <div className="social-actions">
          <button
            className={`social-btn like-btn ${liked ? 'active' : ''}`}
            onClick={handleLike}
          >
            <FontAwesomeIcon icon={liked ? faHeart : faHeartRegular} />
            <span>{likeCount}</span>
          </button>

          <button
            className="social-btn comment-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <FontAwesomeIcon icon={faComment} />
            <span>{commentCount}</span>
          </button>

          <button
            className="social-btn share-btn"
            onClick={handleShare}
          >
            <FontAwesomeIcon icon={faShare} />
            <span>Share</span>
          </button>

          <button
            className={`social-btn bookmark-btn ${bookmarked ? 'active' : ''}`}
            onClick={handleBookmark}
          >
            <FontAwesomeIcon icon={bookmarked ? faBookmark : faBookmarkRegular} />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="comments-section">
            <div className="comments-list">
              {comments.map((comment, index) => (
                <div key={index} className="comment">
                  <div className="comment-header">
                    <span className="comment-user">{comment.userName}</span>
                    <span className="comment-time">
                      {new Date(comment.commentedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))}
            </div>

            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="comment-input"
              />
              <button type="submit" className="comment-submit" disabled={loading}>
                {loading ? 'Posting...' : 'Post'}
              </button>
            </form>
          </div>
        )}

        <div className="info">
          <div className="source-info">
            <span className="font-semibold">Source:</span>
            <a
              href={props.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              {props.source.substring(0, 70)}
            </a>
          </div>
          <div className="origin">
            <p className="origin-item">
              <span className="font-semibold">Author:</span> {props.author}
            </p>
            <p className="origin-item">
              <span className="font-semibold">Published At:</span> {props.publishedAt}
            </p>
          </div>
        </div>
      </div>

      {/* New card content */}
      {/* <div className="card-flex">
        <div
          className="card-image"
          style={{ backgroundImage: `url(${props.imageUrlLeft})` }}
          title={props.imageLeftTitle}
        ></div>
        <div className="card-content">
          <div className="content-header">
            <p className="text-sm text-gray">
              {props.memberIcon && (
                <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  {props.memberIcon}
                </svg>
              )}
              {props.memberText}
            </p>
            <div className="card-title">
              {props.cardTitle}
            </div>
            <p className="card-description">{props.cardDescription}</p>
          </div>
          <div className="author-info">
            {props.authorImage && (
              <img className="author-avatar" src={props.authorImage} alt="Avatar" />
            )}
            <div className="author-text">
              <p className="author-name">{props.authorName}</p>
              <p className="published-date">{props.publishedDate}</p>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default Card;

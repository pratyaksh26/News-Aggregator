import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./Components/Navbar";
import Allnews from "./Components/Allnews";
import Topnews from "./Components/Topnews";
import Countrynews from "./Components/Countrynews";
import Footer from "./Components/Footer";
import LoginPage from "./Components/LoginPage";

function App() {
  return (
    <AuthProvider>
      <div className="w-full">
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Allnews />} />
            <Route path="/top-headlines/:category" element={<Topnews />} />
            <Route path="/country/:iso" element={<Countrynews />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
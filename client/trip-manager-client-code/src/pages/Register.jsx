import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api";
import SchoolDetails from "../components/SchoolDetails.jsx";
import UserDetails from "../components/UserDetails.jsx";
import { setCredentials } from "../store/authSlice.js";
import "./Login.css";

export default function Register() {
  const [step, setStep] = useState(1);
  const [schoolData, setSchoolData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const paramStep = parseInt(params.step, 10);
    if (!paramStep || (paramStep !== 1 && paramStep !== 2)) {
      navigate("/register/1", { replace: true });
      return;
    }
    setStep(paramStep);
  }, [params.step, navigate]);

  function handleSchoolSubmit(data) {
    setSchoolData(data);
    navigate("/register/2");
  }

  function handleBack(currentUserData) {
    if (currentUserData) {
      setUserData(currentUserData);
    }
    navigate("/register/1");
  }

  async function handleUserSubmit(submittedUserData) {
    setUserData(submittedUserData);
    setLoading(true);
    try {
      const response = await api.post("/api/auth/register", {
        ...schoolData,
        ...submittedUserData,
        role: "principal",
      });
      const user = response.data;
      dispatch(
        setCredentials({
          userId: user.userId,
          role: user.role,
          roles: user.roles || [user.role],
          nationalId: user.nationalId,
        }),
      );
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "הרישום נכשל, נסה שנית");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-form-panel auth-form-panel--scroll">
        <p className="auth-form-heading">
          {step === 1 ? "פרטי מוסד" : "פרטי מנהל"}
        </p>
        {step === 1 && (
          <SchoolDetails
            onSubmit={handleSchoolSubmit}
            initialData={schoolData}
          />
        )}
        {step === 2 && (
          <UserDetails
            onSubmit={handleUserSubmit}
            onBack={handleBack}
            initialData={userData}
            hideRoleSelect={true}
            loading={loading}
            submitLabel={loading ? "יוצר חשבון..." : "צור חשבון"}
          />
        )}
        {error && <p className="errorLog">{error}</p>}
        <p className="auth-alt-link">
          כבר יש חשבון?
          <button type="button" onClick={() => navigate("/login")}>
            כניסה
          </button>
        </p>
      </div>
    </div>
  );
}

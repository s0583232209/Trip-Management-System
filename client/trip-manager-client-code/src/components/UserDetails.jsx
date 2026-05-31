import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { appContext } from "../App";
import api from "../api";
import { useState } from "react";

return (
  <form>
    <label htmlFor="name">שם מלא</label>
    <input type="text" id="name" autoComplete="name" {...register("name")} />
    <label htmlFor="nationalId">מספר תעודת זהות</label>
    <input
      type="text"
      id="nationalId"
      autoComplete="nationalId"
      {...register("nationalId")}
    />

    <label htmlFor="password">סיסמה</label>
    <input
      type="password"
      id="password"
      autoComplete="new-password"
      {...register("password")}
    />

    <label htmlFor="email">כתובת דואר אלקטרוני</label>
    <input
      type="email"
      id="email"
      autoComplete="email"
      {...register("email")}
    />

    <label htmlFor="phoneNumber">מספר טלפון</label>
    <input
      type="text"
      id="phoneNumber"
      autoComplete="tel"
      {...register("phoneNumber")}
    />

    <label htmlFor="istitutionNumber">סמל מוסד</label>
    <input
      type="number"
      id="istitutionNumber"
      autoComplete="istitution-number"
      {...register("istitutionNumber")}
    />
  </form>
);

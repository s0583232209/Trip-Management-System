import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { appContext } from "../App";
import api from "../api";
import { useState } from "react";

return (
  <form>
    <label htmlFor="name">שם מוסד</label>
    <input type="text" id="name" autoComplete="name" {...register("name")} />

    <label htmlFor="istitutionNumber">סמל מוסד</label>
    <input
      type="number"
      id="istitutionNumber"
      autoComplete="istitution-number"
      {...register("istitutionNumber")}
    />

    <label htmlFor="email">כתובת דואר אלקטרוני ליצירת קשר</label>
    <input
      type="email"
      id="email"
      autoComplete="email"
      {...register("email")}
    />

    <label htmlFor="phoneNumber">מספר טלפון ליצירת קשר</label>
    <input
      type="text"
      id="phoneNumber"
      autoComplete="tel"
      {...register("phoneNumber")}
    />
    
    <label htmlFor="city">עיר</label>
    <input
      type="text"
      id="city"
      autoComplete="address-level2"
      {...register("city")}
    />

    <label htmlFor="role">רחוב</label>
    <input
      type="text"
      id="role"
      autoComplete="role"
      {...register("role")}
    />

    <label htmlFor="houseNumber">מספר</label>
    <input type="number" id="houseNumber" {...register("houseNumber")} />
    
    <label htmlFor="zipcode">מיקוד</label>
    <input
      type="number"
      id="zipcode"
      autoComplete="postal-code"
      {...register("zipcode")}
    />

  </form>
);

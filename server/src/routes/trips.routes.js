import express from 'express'

const router=express.Router();
router.get("/",()=>{return "trips: get all"})
router.post("/",()=>{return "trips: post add a trip"})
router.get("/:id",()=>{return "trips: get by id"})
router.delete("/:id",()=>{return "trips: delete by id"})
router.put("/:id/approve",()=>{return "trips: put, approve trip"+id })
router.put("/:id/close",()=>{return "trips: put, close trip"+id } )
router.get("/:id/staff",()=>{return "trips: get, staff"})
router.post("/:id/staff",()=>{return "trips: post, staff"})
export default router
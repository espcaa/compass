import { db } from "../../db";
import { users } from "../../db/schema";

export function GetAllUsers() {
  const usersRows = db.select().from(users).all();
  return usersRows;
}

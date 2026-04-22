import { testconn } from "./database/supabase";


(async () => {
    if (await testconn()) {
        console.log("Database connection successfully!!!!")
    }
})()

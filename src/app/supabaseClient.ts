import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bsxdijpogfixjkbceunj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeGRpanBvZ2ZpeGprYmNldW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NzAzODksImV4cCI6MjA1ODQ0NjM4OX0.BuT8AgSBI4lM_6ZTrAfjBHROPCSfltmyPRLfDjxogUA";

export const supabase = createClient(supabaseUrl, supabaseKey);

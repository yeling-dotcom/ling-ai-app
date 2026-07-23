import { AdminNav } from "../../admin-nav";
import { PostForm } from "../post-form";

export default function NewPostPage() {
  return <main><div className="admin-shell"><AdminNav /><section><p className="eyebrow">Publishing desk</p><h2>New post</h2><PostForm /></section></div></main>;
}

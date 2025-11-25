import Link from "next/link"
import styles from "./page.module.css";

const apps = [
  { id: "todo", name: "Todo List", path: "/todo", description: "タスク管理アプリ", color:"#ffe4e1"},
{id: "todo_kari", name: "電卓", path: "/calc", description: "計算アプリ", color:"blue"},
{id: "todo_tigauyo", name: "Todo List", path: "/todos", description: "タスク管理アプリ", color:"#928501"},
]


export default function Home() {
  return (
    <main>
      <h1 className={styles.title}>My universe</h1>

      <div className={styles.container}>
        {apps.map((app) => (
          <Link key={app.id} href={app.path} className={styles.card} style={{ backgroundColor: app.color}}>
            <h1>{app.name}</h1>
            <p>{app.description}</p>
          </Link>
        ))}
      </div>
    </main>
    
   
  );
}

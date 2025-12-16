import Link from "next/link"
import styles from "./page.module.css";

const apps = [
  { id: "todo", name: "Todo List", path: "/todo", description: "タスク管理アプリ", color:"#ffe4e1"},
{id: "calc", name: "電卓", path: "/calc", description: "計算アプリ", color:"blue"},
{id: "pachinco", name: "パチンコ確率機", path: "/pachinco", description: "パチンコ確率アプリ", color:"red"},
{id: "SG", name: "ソシャゲの面白いところだけを集めたい", path: "/sg", description: "ソシャゲ濃縮アプリ", color:"green"},
{id: "VS", name: "ヴァンサバみたいなの作りたい", path: "/vs", description: "ヴァンパイアサバイバーもどき", color:"green"},
]


export default function Home() {
  return (
    <main>
      <h1 className={styles.title}>
        <div className={styles.Text}>My universe</div>
        </h1>

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

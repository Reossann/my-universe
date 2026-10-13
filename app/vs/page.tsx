import Game from "./components/Game";

export default function VSPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "#101820",
      }}
    >
      <h1 style={{ color: "white" }}>My Survivor Game</h1>

      <p style={{ color: "white" }}>WASD または矢印キーで移動</p>

      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          aspectRatio: "4 / 3",
          marginTop: "20px",
          border: "2px solid #555",
        }}
      >
        <Game />
      </div>
    </main>
  );
}

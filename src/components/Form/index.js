import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./Form.module.css";

function Form({ onCadastroSucesso }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  function senhaValida(senha) {
    return (
      senha.length >= 8 &&
      /[0-9]/.test(senha) &&
      /[A-Z]/.test(senha) &&
      /[!@#$%^&*(),.?":{}|<>_\-\\[\]/]/.test(senha)
    );
  }

  const podeEnviar =
    email !== "" &&
    senha !== "" &&
    confirmarSenha !== "" &&
    senhaValida(senha) &&
    senha === confirmarSenha;

  function handleSubmit(e) {
    e.preventDefault();
    if (podeEnviar) {
      onCadastroSucesso?.();
    }
  }

  return (
    <form className={styles.formulario} onSubmit={handleSubmit}>
      <h2>Cadastro</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className={styles.senhaContainer}>
        <input
          type={mostrarSenha ? "text" : "password"}
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <span
          className={styles.olho}
          onClick={() => setMostrarSenha((p) => !p)}
        >
          {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      <div className={styles.senhaContainer}>
        <input
          type={mostrarConfirmar ? "text" : "password"}
          placeholder="Confirmar senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />

        <span
          className={styles.olho}
          onClick={() => setMostrarConfirmar((p) => !p)}
        >
          {mostrarConfirmar ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      <p className={styles.erroBox}>
        {!senhaValida(senha) && senha.length > 0
          ? "Senha fraca"
          : "\u00A0"}
      </p>

      <p className={styles.erroBox}>
        {senha !== confirmarSenha && confirmarSenha.length > 0
          ? "Senhas não coincidem"
          : "\u00A0"}
      </p>

      <button type="submit" disabled={!podeEnviar}>
        Enviar
      </button>
    </form>
  );
}

export default Form;
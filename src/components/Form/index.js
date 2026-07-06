import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./Form.module.css";

function Form() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function senhaValida(senha) {
    const temMinimo = senha.length >= 8;
    const temNumero = /[0-9]/.test(senha);
    const temMaiuscula = /[A-Z]/.test(senha);
    const temEspecial = /[!@#$%^&*(),.?":{}|<>_\-\\[\]/]/.test(senha);

    return temMinimo && temNumero && temMaiuscula && temEspecial;
  }

  const camposPreenchidos =
    email !== "" && senha !== "" && confirmarSenha !== "";

  const senhaEhValida = senhaValida(senha);
  const senhasConferem = senha === confirmarSenha;

  const podeEnviar = camposPreenchidos && senhaEhValida && senhasConferem;

  return (
    <div className={styles.formulario}>
      <h2>Cadastro</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* SENHA */}
      <div className={styles.senhaContainer}>
        <input
          type={mostrarSenha ? "text" : "password"}
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </div>

      {/* CONFIRMAR SENHA */}
      <div className={styles.senhaContainer}>
        <input
          type={mostrarSenha ? "text" : "password"}
          placeholder="Confirmar senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />

        <span
          className={styles.olho}
          onClick={() => setMostrarSenha(!mostrarSenha)}
        >
          {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      {/* ERROS */}
      {!senhaEhValida && senha.length > 0 && (
        <p style={{ color: "red", fontSize: "12px" }}>
          Senha fraca: 8+ caracteres, 1 número, 1 maiúscula e 1 especial.
        </p>
      )}

      {!senhasConferem && confirmarSenha.length > 0 && (
        <p style={{ color: "red", fontSize: "12px" }}>
          As senhas não coincidem.
        </p>
      )}

      {/* BOTÃO */}
      <button
        disabled={!podeEnviar}
        style={{
          backgroundColor: podeEnviar ? "green" : "gray",
          color: "white",
          cursor: podeEnviar ? "pointer" : "not-allowed",
        }}
      >
        Enviar
      </button>
    </div>
  );
}

export default Form;
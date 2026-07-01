import styles from './Login.module.css';

function Login() {
  return (
    <div className={styles.login}>
      <h2>Login</h2>
      <input type="text" placeholder="Nome" />
      <input type="email" placeholder="Email" />
      <button>Enviar</button>
    </div>
  );
}

export default Login;
import styles from './Form.module.css';

function verificarCampos() {
  const email = document.getElementById('email');
  const senha = document.getElementById('senha');
  const enviar = document.getElementById('enviar');

  if (email.value !== '' && senha.value !== '') {
    enviar.style.backgroundColor = 'green';
    enviar.style.color = 'white';
  } else {
    enviar.style.backgroundColor = 'gray';
    enviar.style.color = 'black';
  }
}

function Form() {
  return (
    <div className={styles.formulario}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        id="email"
        onChange={verificarCampos}
      />

      <input
        type="password"
        placeholder="Senha"
        id="senha"
        onChange={verificarCampos}
      />

      <button id="enviar" style={{backgroundColor:'gray'}}>Enviar</button>
    </div>
  );
}

export default Form;
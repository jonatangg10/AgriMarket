const pasos = [
  {
    numero: "01",
    titulo: "Eliges",
    texto: "Filtra por municipio, temporada o productor.",
  },
  {
    numero: "02",
    titulo: "El productor cosecha",
    texto: "Recibe tu pedido y cosecha solo lo vendido.",
  },
  {
    numero: "03",
    titulo: "Empaquetamos",
    texto: "Cadena de frío y empaque que protege la frescura.",
  },
  {
    numero: "04",
    titulo: "Lo recibes",
    texto: "Paga con PSE, Nequi o contra entrega.",
  },
];

const HowItWorks = () => {
  return (
    <section className="w-full px-4 pt-16">
      <div className="mx-auto max-w-6xl rounded-3xl bg-[#14432F] p-6 text-white sm:p-10">
        <h2 className="mb-8 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Así funciona
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((paso) => (
            <div key={paso.numero}>
              <span className="text-xs font-bold text-[#F6D77A]">
                {paso.numero}
              </span>
              <h3 className="mt-1 text-base font-bold">{paso.titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#D8E6DC]">
                {paso.texto}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
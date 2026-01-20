export function CadastroOnibus() {
  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-bold text-success">Cadastro de Ônibus</h5>
        </div>
        <div className="card-body p-4">
            <form>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Nome do Ônibus</label>
                        <input type="text" className="form-control" placeholder="Ex: Rota Centro" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Placa</label>
                        <input type="text" className="form-control" placeholder="ABC-1234" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Motorista</label>
                        <input type="text" className="form-control" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Capacidade</label>
                        <input type="number" className="form-control" />
                    </div>
                    <div className="col-12 text-end mt-4">
                        <button className="btn btn-success text-white px-4">Salvar Ônibus</button>
                    </div>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
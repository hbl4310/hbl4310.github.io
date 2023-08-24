function changeShapes() {
    for (const e of document.getElementsByClassName("shapes")) {
        const data = e.dataset; 
        const shapesIntervalMs = data.intervalms, 
                shapesConfigs = data.numshapes,
                shapesRounds = data.numrounds;
        setInterval(() => {
            data.configuration = rand(1, shapesConfigs);
            data.roundness = rand(1, shapesRounds);
        }, shapesIntervalMs);
    }
}
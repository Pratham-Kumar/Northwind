// srv/media-service.js
module.exports = async function () {
    this.on('READ', 'Files', async (req) => {
        const { ID } = req.params;
        if (Array.isArray(ID)) {
            const fileDataArray = await Promise.all(
                ID.map(async (id) => {
                    const fileData = await this.run(
                        SELECT.from('Files').columns(['content', 'mediaType', 'fileName', 'size']).byKey(id)
                    );
                    return fileData;
                })
            );
            req.reply(fileDataArray);
        } else {
            const fileData = await this.run(
                SELECT.from('Files').columns(['content', 'mediaType', 'fileName', 'size']).byKey(ID)
            );
            if (!fileData) {
                req.reject(404, `File with ID ${ID} not found`);
            }
            req.reply(fileData);
        }
    });

    this.on('DELETE', 'Files', async (req) => {
        const { ID } = req.params;
        await this.run(DELETE.from('Files').byKey(ID));
        req.reply(204); // No content
    });
};

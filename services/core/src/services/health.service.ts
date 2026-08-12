import { prisma } from "../lib/prisma";

class HealthService {
    async checkDatabase(): Promise<boolean> {
        return prisma.$queryRaw`SELECT 1`
            .then(() => true)
            .catch((error: unknown) => {
                console.error("DatabaseHealthCheckFailed", { error });
                return false;
            });
    }
}

export default new HealthService();

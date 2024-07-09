import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"

export async function confirmTrip(app: FastifyInstance){
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
    schema: {   
      params: z.object({
        tripId: z.string().uuid(),
      })
    },
  }, async ( req, res )=>{
    return { tripId: req.params.tripId }
  })
}

const users: any[] = []

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { userId, name, password} = body

    if (!userId || !password || !name) {
        throw createError ({
            statusCode: 400,
            statusMessage: '全ての項目を入力してください'
        })
    }

    const exists = users.find (u => u.userId === userId)
    if(exists){
        throw createError ({
            statusCode: 400,
            statusMessage: 'このユーザーIDは使われています'
        })
    }

    const newUser = { userId, name, password }
    users.push(newUser)

    return {
        success: true,
        user: { userId, name }
    }
})
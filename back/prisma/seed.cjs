const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const achievements = [
    {
      key: "first_game_played",
      title: "Welcome to the game",
      description: "Play your first game.",
      category: "games",
      points: 10,
    },
    {
      key: "first_game_won",
      title: "First victory",
      description: "Win your first game.",
      category: "games",
      points: 20,
    },
    {
      key: "first_chat_message",
      title: "Hello there",
      description: "Send your first chat message.",
      category: "social",
      points: 10,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        points: achievement.points,
      },
      create: achievement,
    });
  }

  const users = [
    {
      email: "alice@example.com",
      username: "alice",
      passwordHash: "dev_hash_alice",
      bio: "Seed user for local development.",
    },
    {
      email: "bob@example.com",
      username: "bob",
      passwordHash: "dev_hash_bob",
      bio: "Seed user for local development.",
    },
  ];

  for (const user of users) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        bio: user.bio,
      },
      create: user,
    });

    await prisma.userStat.upsert({
      where: { userId: createdUser.id },
      update: {},
      create: {
        userId: createdUser.id,
      },
    });
  }

  const alice = await prisma.user.findUniqueOrThrow({ where: { email: "alice@example.com" } });
  const bob = await prisma.user.findUniqueOrThrow({ where: { email: "bob@example.com" } });

  await prisma.friendship.upsert({
    where: {
      requesterId_addresseeId: {
        requesterId: alice.id,
        addresseeId: bob.id,
      },
    },
    update: {
      status: "ACCEPTED",
      respondedAt: new Date(),
    },
    create: {
      requesterId: alice.id,
      addresseeId: bob.id,
      status: "ACCEPTED",
      respondedAt: new Date(),
    },
  });

  const existingMessage = await prisma.message.findFirst({
    where: {
      senderId: alice.id,
      recipientId: bob.id,
      content: "Welcome to ft_transcendence dev seed.",
    },
  });

  if (!existingMessage) {
    await prisma.message.create({
      data: {
        senderId: alice.id,
        recipientId: bob.id,
        content: "Welcome to ft_transcendence dev seed.",
      },
    });
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

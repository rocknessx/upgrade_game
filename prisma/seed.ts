import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo communities
  const communities = await Promise.all([
    prisma.community.upsert({
      where: { name: 'turkey' },
      update: {},
      create: {
        name: 'turkey',
        title: 'Turkey',
        description: 'Türkiye hakkında her şey',
        memberCount: 1250000,
      },
    }),
    prisma.community.upsert({
      where: { name: 'gaming' },
      update: {},
      create: {
        name: 'gaming',
        title: 'Gaming',
        description: 'Oyun dünyasından haberler',
        memberCount: 980000,
      },
    }),
    prisma.community.upsert({
      where: { name: 'knightonline' },
      update: {},
      create: {
        name: 'knightonline',
        title: 'Knight Online',
        description: 'Knight Online oyuncuları için community',
        memberCount: 45000,
      },
    }),
  ])

  // Create demo users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'demo@reddit.com' },
      update: {},
      create: {
        username: 'demouser',
        email: 'demo@reddit.com',
        upgradeLevel: 3,
        upgradePoints: 150,
        totalUpvotes: 45,
      },
    }),
    prisma.user.upsert({
      where: { email: 'gamer@reddit.com' },
      update: {},
      create: {
        username: 'progamer',
        email: 'gamer@reddit.com',
        upgradeLevel: 7,
        upgradePoints: 80,
        totalUpvotes: 120,
      },
    }),
    prisma.user.upsert({
      where: { email: 'knight@reddit.com' },
      update: {},
      create: {
        username: 'knightmaster',
        email: 'knight@reddit.com',
        upgradeLevel: 10,
        upgradePoints: 50,
        totalUpvotes: 200,
      },
    }),
  ])

  // Create demo posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Reddit KO\'ya Hoş Geldiniz! 🎉',
        content: `Merhaba Knight Online ve Reddit severleri!

Bu platformda hem Reddit'in sosyal özelliklerini kullanabilir, hem de Knight Online'ın efsanevi upgrade sistemini deneyimleyebilirsiniz.

**Nasıl çalışıyor?**
- Post paylaşın, yorum yapın: +1-2 point
- Upvote alın: +5 point  
- Point'leri kullanarak seviyenizi yükseltin (+1'den +10'a kadar)
- Yüksek seviyelerde upgrade şansı azalır, tıpkı KO'da olduğu gibi!

Güvenli taş kullanmayı unutmayın! 😄`,
        type: 'TEXT',
        score: 42,
        authorId: users[0].id,
        communityId: communities[0].id,
      },
    }),
    prisma.post.create({
      data: {
        title: '+10 Seviyesine Ulaştım! 🌟',
        content: `Arkadaşlar, sonunda +10 seviyesine ulaştım! 

Tam 15 deneme sürdü ve çok güvenli taş harcadım ama sonunda başardım. +9'dan +10'a çıkarken kalbim çıkacaktı sanki gerçek KO oynuyormuşum gibi 😅

Tüm KO oyuncularına şans diliyorum!`,
        type: 'TEXT',
        score: 89,
        authorId: users[2].id,
        communityId: communities[2].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Upgrade Sistemi Hakkında İpuçları',
        content: `Yeni başlayanlar için birkaç ipucu:

1. **+6'ya kadar güvenli taş gereksiz** - %100 başarı şansı var
2. **+7'den sonra dikkatli olun** - Başarısızlık durumunda seviye yarıya düşer
3. **Point'leri akıllıca harcayın** - Her upgrade girişimi point harcar
4. **Upvote alarak point kasın** - Her upvote +5 point demek

Bu sistemi çok sevdim, gerçek nostalji! 🗡️`,
        type: 'TEXT',
        score: 67,
        authorId: users[1].id,
        communityId: communities[1].id,
      },
    }),
  ])

  // Create demo comments
  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Harika bir başlangıç! Bu sistemi çok beğendim 👏',
        score: 12,
        authorId: users[1].id,
        postId: posts[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Tebrikler! +10 gerçekten zor, ben hâlâ +7\'deyim 😅',
        score: 8,
        authorId: users[0].id,
        postId: posts[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Çok yararlı ipuçları, teşekkürler! Acemi oyuncular mutlaka okumalı.',
        score: 15,
        authorId: users[2].id,
        postId: posts[2].id,
      },
    }),
  ])

  // Create some upgrade logs
  await Promise.all([
    prisma.upgradeLog.create({
      data: {
        userId: users[2].id,
        fromLevel: 9,
        toLevel: 10,
        success: true,
        pointsUsed: 1000,
        safeguard: true,
      },
    }),
    prisma.upgradeLog.create({
      data: {
        userId: users[2].id,
        fromLevel: 9,
        toLevel: null,
        success: false,
        pointsUsed: 1000,
        safeguard: true,
      },
    }),
  ])

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

module.exports = (uiModel) => {
  const featuredCommunityMemberCompleteName = uiModel.featuredCommunityMembers.map((communityMember) => communityMember.fullName).join(' & ')
  let featuredCommunityMemberIntro
  if (uiModel.featuredCommunityMembers.length > 1) {
    featuredCommunityMemberIntro = `This week's featured community members are ${featuredCommunityMemberCompleteName}.`
  } else {
    featuredCommunityMemberIntro = `This week's featured community member is ${featuredCommunityMemberCompleteName}.`
  }
  const featuredCommunityMemberTitle = uiModel.featuredCommunityMembers.length > 1 ? `Featured Community Members: ${featuredCommunityMemberCompleteName}` : `Featured Community Member: ${featuredCommunityMemberCompleteName}`
  const linkedInLinks = uiModel.featuredCommunityMembers.map((communityMember) => `https://www.linkedin.com/in/name[Connect with ${communityMember.firstName} on LinkedIn, role="medium button"]`).join('\n\n')
  return `= This Week in Neo4j -
// update slug according to the blog post title, slug must only contain lowercase alphanumeric words separated by dashes, e.g. "this-week-in-neo4j-twitchverse-java-drivers-encryption"
:slug: this-week-in-neo4j-
:noheader:
:linkattrs:
:categories: ${uiModel.categories}
:author: ${uiModel.author}
// twin4j is added automatically; consolidate all tags in each feature to this attribute removing duplicates
:tags:

Hello, everyone!

// introduction

[#featured-community-member,hashtags="neo4j, "]
== ${featuredCommunityMemberTitle}

:tags:

${featuredCommunityMemberIntro}

featured::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[name="${featuredCommunityMemberCompleteName}"]

// featured community member(s) presentation

// linkedin link(s)
${linkedInLinks}

[#features-1,hashtags="neo4j, "]
== Feature 1

:tags:

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[#features-2,hashtags="neo4j, "]
== Feature 2

:tags:

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[#features-3,hashtags="neo4j, "]
== Feature 3

:tags:

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[#features-4,hashtags="neo4j, "]
== Feature 4

:tags:

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[#features-5,hashtags="neo4j, "]
== Feature 5

:tags:

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[#features-6,hashtags="neo4j, "]
== Feature 6

:tags:

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

[#features-7,hashtags="neo4j, "]
== Feature 7

:tags:

image::https://dist.neo4j.com/wp-content/uploads/xyz/image.jpeg[width=150,float="right"]

// 3-4 paragraphs

https://call-to-action-url/[Action, role="medium button"]

== Tweet of the Week

My favorite tweet this week was by https://twitter.com/handle[name^]:

// replace nnnn with the tweet ID

tweet::nnnn[type={type}]

Don't forget to RT if you liked it too!
`
}

const Team = require('../models/Team');
const Post = require('../models/Post');
const User = require('../models/User');

// ════════════════════════════════════════════════════════════
// @desc    Create new team
// @route   POST /api/teams
// @access  Private
// ════════════════════════════════════════════════════════════
exports.createTeam = async (req, res) => {
  try {
    const { name, description, isPrivate, maxMembers } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required'
      });
    }

    const team = await Team.create({
      name,
      description: description || '',
      owner: req.user._id,
      isPrivate: isPrivate || false,
      maxMembers: maxMembers || 20,
      members: [{
        user: req.user._id,
        role: 'admin'
      }]
    });

    // Generate invite code
    await team.generateInviteCode();

    res.status(201).json({
      success: true,
      message: 'Team created successfully!',
      data: team
    });
  } catch (error) {
    console.error('Create Team Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create team',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get all teams (user is member of)
// @route   GET /api/teams/my-teams
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      'members.user': req.user._id
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name xp level streak')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Get My Teams Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teams',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email xp level')
      .populate('members.user', 'name xp level streak badges');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is member
    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this team'
      });
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Get Team Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Join team with invite code
// @route   POST /api/teams/join
// @access  Private
// ════════════════════════════════════════════════════════════
exports.joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        message: 'Invite code is required'
      });
    }

    const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      });
    }

    if (team.isMember(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member'
      });
    }

    await team.addMember(req.user._id);

    res.status(200).json({
      success: true,
      message: `Joined ${team.name}!`,
      data: team
    });
  } catch (error) {
    console.error('Join Team Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to join team'
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Leave team
// @route   POST /api/teams/:id/leave
// @access  Private
// ════════════════════════════════════════════════════════════
exports.leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (!team.isMember(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member'
      });
    }

    // Owner cannot leave
    if (team.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Owner cannot leave. Transfer ownership or delete the team.'
      });
    }

    await team.removeMember(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Left team successfully'
    });
  } catch (error) {
    console.error('Leave Team Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave team',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get team feed
// @route   GET /api/teams/:id/feed
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getTeamFeed = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const posts = await Post.find({ team: req.params.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name xp level streak')
      .populate('comments.user', 'name')
      .populate('reactions.user', 'name');

    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get Team Feed Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team feed',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get team leaderboard
// @route   GET /api/teams/:id/leaderboard
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getLeaderboard = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'name xp level streak badges');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Sort members by XP
    const leaderboard = team.members
      .map(member => ({
        user: member.user,
        role: member.role,
        totalXP: member.user.xp,
        level: member.user.level,
        streak: member.user.streak,
        joinedAt: member.joinedAt
      }))
      .sort((a, b) => b.totalXP - a.totalXP);

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get Leaderboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Delete team (owner only)
// @route   DELETE /api/teams/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only owner can delete team'
      });
    }

    await team.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete Team Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team',
      error: error.message
    });
  }
};

module.exports = exports;

// ════════════════════════════════════════════════════════════
// @desc    Create new team
// @route   POST /api/teams
// @access  Private
// ════════════════════════════════════════════════════════════
exports.createTeam = async (req, res) => {
  try {
    const { name, description, isPrivate, maxMembers } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required'
      });
    }

    const team = await Team.create({
      name,
      description: description || '',
      owner: req.user._id,
      isPrivate: isPrivate || false,
      maxMembers: maxMembers || 20,
      members: [{
        user: req.user._id,
        role: 'admin'
      }]
    });

    // Generate invite code
    await team.generateInviteCode();

    res.status(201).json({
      success: true,
      message: 'Team created successfully!',
      data: team
    });
  } catch (error) {
    console.error('Create Team Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create team',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get all teams (user is member of)
// @route   GET /api/teams/my-teams
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      'members.user': req.user._id
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name xp level streak')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Get My Teams Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teams',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email xp level')
      .populate('members.user', 'name xp level streak badges');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is member
    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this team'
      });
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Get Team Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Join team with invite code
// @route   POST /api/teams/join
// @access  Private
// ════════════════════════════════════════════════════════════
exports.joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        message: 'Invite code is required'
      });
    }

    const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      });
    }

    if (team.isMember(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member'
      });
    }

    await team.addMember(req.user._id);

    res.status(200).json({
      success: true,
      message: `Joined ${team.name}!`,
      data: team
    });
  } catch (error) {
    console.error('Join Team Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to join team'
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Leave team
// @route   POST /api/teams/:id/leave
// @access  Private
// ════════════════════════════════════════════════════════════
exports.leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (!team.isMember(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member'
      });
    }

    // Owner cannot leave
    if (team.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Owner cannot leave. Transfer ownership or delete the team.'
      });
    }

    await team.removeMember(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Left team successfully'
    });
  } catch (error) {
    console.error('Leave Team Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave team',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get team feed
// @route   GET /api/teams/:id/feed
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getTeamFeed = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const posts = await Post.find({ team: req.params.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name xp level streak')
      .populate('comments.user', 'name')
      .populate('reactions.user', 'name');

    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get Team Feed Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team feed',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get team leaderboard
// @route   GET /api/teams/:id/leaderboard
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getLeaderboard = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'name xp level streak badges');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Sort members by XP
    const leaderboard = team.members
      .map(member => ({
        user: member.user,
        role: member.role,
        totalXP: member.user.xp,
        level: member.user.level,
        streak: member.user.streak,
        joinedAt: member.joinedAt
      }))
      .sort((a, b) => b.totalXP - a.totalXP);

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get Leaderboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Delete team (owner only)
// @route   DELETE /api/teams/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only owner can delete team'
      });
    }

    await team.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete Team Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team',
      error: error.message
    });
  }
};

module.exports = exports;
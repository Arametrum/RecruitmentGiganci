using System;
using System.Collections.Generic;

namespace RecruitmentGiganci.Server.Models;

public partial class Chat
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? ChatString { get; set; }
}

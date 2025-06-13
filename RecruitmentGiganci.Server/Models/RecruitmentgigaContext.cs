using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using RecruitmentGiganci.Server.Models;

namespace RecruitmentGiganci.Server;

public partial class RecruitmentgigaContext : DbContext
{
    public RecruitmentgigaContext()
    {
    }

    public RecruitmentgigaContext(DbContextOptions<RecruitmentgigaContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Chat> Chats { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Data Source=sql.bsite.net\\MSSQL2016;Initial Catalog=recruitmentgiga_;Persist Security Info=True;User ID=recruitmentgiga_;Password=RecruitmentGiga;Trust Server Certificate=True");
    //This obviously should not be hardcoded in production code, a secret manager or env vars should be used instead
    //It will suffice for the purpose of this recruitment task
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Chat>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Chats__3214EC076C4E8209");

            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Messages__3214EC075A36C1ED");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
